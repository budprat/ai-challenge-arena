import logging
import aiohttp
import json
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)

async def generate_evaluation_rubric(challenge_description: str, challenge_rules: str) -> Dict[str, Any]:
    """
    Generate an evaluation rubric for a challenge using AI
    
    Args:
        challenge_description: Description of the challenge
        challenge_rules: Rules of the challenge
    
    Returns:
        A dictionary containing the evaluation criteria
    """
    try:
        # Prepare prompt for LLM
        prompt = f"""
# Task: Generate Evaluation Rubric

## Challenge Description
{challenge_description}

## Challenge Rules
{challenge_rules}

## Instructions
Create a comprehensive evaluation rubric for judging submissions to this AI builder challenge. The rubric should:

1. Include 5-7 distinct evaluation criteria that are directly relevant to this specific challenge
2. Assign appropriate weights to each criterion (weights should sum to 10)
3. Provide a clear description of what each criterion means
4. Include concrete examples of what constitutes excellent, good, average, and poor performance for each criterion

## Required Output Format
Respond with a JSON object that has the following structure:
```json
{{
  "criteria": {{
    "criterion_name_1": {{
      "description": "Clear description of the criterion",
      "weight": 2,
      "excellent_example": "Description of what excellent performance looks like",
      "good_example": "Description of what good performance looks like",
      "average_example": "Description of what average performance looks like",
      "poor_example": "Description of what poor performance looks like"
    }},
    "criterion_name_2": {{
      ...
    }}
  }}
}}
```

Ensure the criteria are thoughtful, meaningful, and specifically tailored to this challenge.
"""
        
        # Call OpenAI API
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4-turbo",
                    "messages": [
                        {"role": "system", "content": "You are an expert in creating fair and comprehensive evaluation rubrics for AI-building challenges."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "response_format": {"type": "json_object"}
                }
            ) as response:
                response_data = await response.json()
                
                if response.status != 200:
                    logger.error(f"LLM API error: {response_data}")
                    return generate_default_rubric()
                
                # Extract JSON response
                result_text = response_data["choices"][0]["message"]["content"]
                result = json.loads(result_text)
                
                # Ensure the response has the expected structure
                if "criteria" not in result:
                    logger.error(f"Unexpected LLM response structure: {result}")
                    return generate_default_rubric()
                
                # Process the rubric to ensure it meets requirements
                return process_rubric(result)
                
    except Exception as e:
        logger.exception(f"Error generating evaluation rubric: {e}")
        return generate_default_rubric()

def process_rubric(rubric: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process the generated rubric to ensure it meets the requirements
    
    Args:
        rubric: The generated rubric
    
    Returns:
        Processed rubric
    """
    # Extract criteria
    criteria = rubric.get("criteria", {})
    
    # Ensure we have at least 3 criteria
    if len(criteria) < 3:
        default_rubric = generate_default_rubric()
        # Add any missing criteria
        for criterion_name, criterion_data in default_rubric["criteria"].items():
            if criterion_name not in criteria:
                criteria[criterion_name] = criterion_data
    
    # Normalize weights
    total_weight = sum(criterion.get("weight", 1) for criterion in criteria.values())
    if total_weight != 10:
        # Adjust weights to sum to 10
        for criterion_name, criterion_data in criteria.items():
            weight = criterion_data.get("weight", 1)
            criteria[criterion_name]["weight"] = round((weight / total_weight) * 10, 1)
    
    # Ensure all required fields are present in each criterion
    required_fields = ["description", "weight", "excellent_example", "good_example", "average_example", "poor_example"]
    for criterion_name, criterion_data in criteria.items():
        for field in required_fields:
            if field not in criterion_data:
                if field == "weight":
                    criterion_data[field] = 1
                else:
                    criterion_data[field] = f"Default {field.replace('_', ' ')} for {criterion_name}"
    
    return {"criteria": criteria}

def generate_default_rubric() -> Dict[str, Any]:
    """
    Generate a default evaluation rubric
    
    Returns:
        Default rubric
    """
    return {
        "criteria": {
            "technical_implementation": {
                "description": "Quality of the technical implementation, including code quality, architecture, and use of appropriate technologies",
                "weight": 3,
                "excellent_example": "Exceptional code quality with a well-designed architecture. Uses appropriate technologies efficiently. Code is well-documented and follows best practices.",
                "good_example": "Good code quality with a solid architecture. Uses appropriate technologies. Code is documented and generally follows best practices.",
                "average_example": "Acceptable code quality with a functional architecture. Some documentation exists but may be incomplete. May have minor issues or inefficiencies.",
                "poor_example": "Poor code quality with significant issues. Architecture is unclear or inappropriate. Little to no documentation. Does not follow best practices."
            },
            "ai_integration": {
                "description": "Effective and creative use of AI in the solution",
                "weight": 3,
                "excellent_example": "Innovative and highly effective use of AI that significantly enhances the solution. AI capabilities are deeply integrated and well-implemented.",
                "good_example": "Effective use of AI that adds value to the solution. AI is well integrated into the overall system.",
                "average_example": "Basic use of AI that adds some value. Integration may be somewhat superficial or limited.",
                "poor_example": "Minimal or ineffective use of AI. AI functionality seems added as an afterthought rather than integral to the solution."
            },
            "user_experience": {
                "description": "Quality of the user experience, including interface design, interaction flow, and usability",
                "weight": 2,
                "excellent_example": "Exceptional user experience with intuitive design. Flow is natural and user interactions are thoughtfully designed. Accessible and user-friendly.",
                "good_example": "Good user experience with clear design. Flow makes sense and interactions work well. Generally accessible and user-friendly.",
                "average_example": "Acceptable user experience but with some usability issues. Flow may be confusing in places. Some accessibility or user-friendliness concerns.",
                "poor_example": "Poor user experience with significant usability issues. Flow is confusing or illogical. Major accessibility or user-friendliness problems."
            },
            "problem_solving": {
                "description": "How effectively the solution addresses the problem or fulfills the requirements of the challenge",
                "weight": 2,
                "excellent_example": "Comprehensively addresses all aspects of the problem with an innovative approach. Goes beyond basic requirements to deliver exceptional value.",
                "good_example": "Effectively addresses most aspects of the problem with a solid approach. Meets all requirements and provides good value.",
                "average_example": "Addresses the core problem but may miss some aspects. Meets basic requirements but doesn't go beyond them.",
                "poor_example": "Only partially addresses the problem. Misses important requirements or aspects of the challenge."
            }
        }
    }
