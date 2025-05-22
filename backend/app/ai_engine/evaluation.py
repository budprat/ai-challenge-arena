import logging
import aiohttp
import json
import os
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings
from app.models.submission import Submission, SubmissionStatus
from app.models.challenge import Challenge
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = logging.getLogger(__name__)

async def evaluate_submission(
    submission_id: str, 
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Evaluate a submission using LLM and automated testing
    
    Args:
        submission_id: ID of the submission to evaluate
        db: Database session
    
    Returns:
        Evaluation results including scores and feedback
    """
    # Fetch submission and related challenge
    from app.models.submission import Submission
    from app.models.challenge import Challenge
    
    result = await db.execute(
        select(Submission)
        .where(Submission.id == submission_id)
    )
    submission = result.scalars().first()
    
    if not submission:
        raise ValueError(f"Submission {submission_id} not found")
    
    challenge_result = await db.execute(
        select(Challenge)
        .where(Challenge.id == submission.challenge_id)
    )
    challenge = challenge_result.scalars().first()
    
    if not challenge:
        raise ValueError(f"Challenge {submission.challenge_id} not found")
    
    # Extract evaluation criteria from challenge
    evaluation_criteria = challenge.evaluation_criteria
    
    # Run sandbox tests on the repository if available
    repo_test_results = {}
    if submission.repo_url:
        try:
            repo_test_results = await test_code_repository(submission.repo_url)
        except Exception as e:
            logger.error(f"Error testing repository: {e}")
            repo_test_results = {
                "error": str(e),
                "test_status": "failed",
                "results": {}
            }
    
    # Generate evaluation using LLM
    llm_evaluation = await evaluate_with_llm(
        submission=submission,
        challenge=challenge,
        evaluation_criteria=evaluation_criteria,
        test_results=repo_test_results
    )
    
    # Combine results
    evaluation_data = {
        "llm_evaluation": llm_evaluation,
        "repo_test_results": repo_test_results,
        "scores": llm_evaluation.get("scores", {}),
        "feedback": llm_evaluation.get("feedback", "")
    }
    
    # Calculate overall score (weighted average of all criteria)
    scores = llm_evaluation.get("scores", {})
    if scores:
        total_score = 0
        total_weight = 0
        
        for criterion, score_data in scores.items():
            weight = score_data.get("weight", 1)
            score = score_data.get("score", 0)
            total_score += score * weight
            total_weight += weight
        
        if total_weight > 0:
            overall_score = total_score / total_weight
        else:
            overall_score = 0
    else:
        overall_score = 0
    
    # Update submission with evaluation results
    submission.llm_score = overall_score
    submission.evaluation_data = evaluation_data
    submission.status = SubmissionStatus.EVALUATED
    
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    
    return evaluation_data

async def evaluate_with_llm(
    submission: Submission,
    challenge: Challenge,
    evaluation_criteria: Dict[str, Any],
    test_results: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate a submission using an LLM
    
    Args:
        submission: Submission object
        challenge: Challenge object
        evaluation_criteria: Evaluation criteria from the challenge
        test_results: Results from automated testing
    
    Returns:
        LLM evaluation results
    """
    try:
        # Prepare the prompt for the LLM
        prompt = generate_evaluation_prompt(
            submission=submission,
            challenge=challenge,
            evaluation_criteria=evaluation_criteria,
            test_results=test_results
        )
        
        # Call OpenAI API
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4-turbo",  # Use a capable model for evaluation
                    "messages": [
                        {"role": "system", "content": "You are an expert evaluator for AI builder challenges. Your task is to evaluate submissions fairly and provide constructive feedback."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,  # Lower temperature for more consistent evaluations
                    "response_format": {"type": "json_object"}
                }
            ) as response:
                response_data = await response.json()
                
                if response.status != 200:
                    logger.error(f"LLM API error: {response_data}")
                    return {
                        "error": "Failed to get evaluation from LLM API",
                        "scores": {},
                        "feedback": "Automated evaluation failed. Please contact support."
                    }
                
                # Extract JSON response
                result_text = response_data["choices"][0]["message"]["content"]
                result = json.loads(result_text)
                
                # Ensure the response has the expected structure
                if "scores" not in result or "feedback" not in result:
                    logger.error(f"Unexpected LLM response structure: {result}")
                    return {
                        "error": "Unexpected response format from LLM API",
                        "scores": {},
                        "feedback": "Automated evaluation failed due to an unexpected response format."
                    }
                
                return result
                
    except Exception as e:
        logger.exception(f"Error in LLM evaluation: {e}")
        return {
            "error": str(e),
            "scores": {},
            "feedback": "Automated evaluation failed due to an internal error."
        }

def generate_evaluation_prompt(
    submission: Submission,
    challenge: Challenge,
    evaluation_criteria: Dict[str, Any],
    test_results: Dict[str, Any]
) -> str:
    """
    Generate the prompt for LLM evaluation
    
    Args:
        submission: Submission object
        challenge: Challenge object
        evaluation_criteria: Evaluation criteria from the challenge
        test_results: Results from automated testing
    
    Returns:
        Evaluation prompt
    """
    prompt = f"""
# Evaluation Task

You are evaluating a submission for the following AI builder challenge:

## Challenge: {challenge.title}

{challenge.description}

## Rules

{challenge.rules}

## Submission Details

- Repository URL: {submission.repo_url or 'Not provided'}
- Presentation Deck: {'Provided' if submission.deck_url else 'Not provided'}
- Demo Video: {'Provided' if submission.video_url else 'Not provided'}
- Submission Description: {submission.description or 'Not provided'}

## Automated Test Results

```json
{json.dumps(test_results, indent=2)}
```

## Evaluation Criteria

```json
{json.dumps(evaluation_criteria, indent=2)}
```

## Evaluation Instructions

1. Evaluate the submission against each criterion in the evaluation criteria.
2. Assign a score (0-100) for each criterion based on how well the submission meets the requirements.
3. Provide specific feedback for each criterion, highlighting strengths and areas for improvement.
4. Ensure your evaluation is fair, unbiased, and based on the provided information.

## Required Output Format

Respond with a JSON object that has the following structure:
```json
{{
  "scores": {{
    "criterion_name": {{
      "score": 85,
      "weight": 2,
      "justification": "Detailed justification for the score"
    }},
    ...
  }},
  "feedback": "Overall feedback with constructive comments"
}}
```

Ensure all criteria from the evaluation_criteria are included in your assessment.
"""
    return prompt

async def test_code_repository(repo_url: str) -> Dict[str, Any]:
    """
    Test a code repository for functionality and quality
    This is a placeholder that would integrate with a real sandbox testing service
    
    Args:
        repo_url: URL of the git repository to test
    
    Returns:
        Test results
    """
    # In a real implementation, this would:
    # 1. Clone the repository in a sandboxed environment
    # 2. Run automated tests appropriate for the challenge
    # 3. Analyze code quality, security, etc.
    # 4. Return comprehensive test results
    
    # For now, return a mock result
    return {
        "test_status": "success",
        "results": {
            "functionality_tests": {
                "passed": 8,
                "failed": 2,
                "skipped": 0
            },
            "code_quality": {
                "maintainability_index": 85,
                "cyclomatic_complexity": 12,
                "duplication_percentage": 5
            },
            "security_scan": {
                "vulnerabilities": []
            }
        }
    }
