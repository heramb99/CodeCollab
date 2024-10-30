import json
import sys
import io
import concurrent.futures
import json

def execute_code(code):
# Redirect stdout to capture output
    output_buffer = io.StringIO()
    sys.stdout = output_buffer

    try:
        # Execute Python code in a safe environment
        exec(code)

        # Get the captured output
        output = output_buffer.getvalue()

    except Exception as e:
        output = str(e)

    finally:
        # Restore stdout
        sys.stdout = sys.__stdout__

    return output

def handler(event, context):
    payload = json.loads(event.get("body"))
    headers =  {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": True
    }
    
    try:
    # Extract code from event
        code = payload.get('code')
    
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(execute_code, code)
            try:
                # Timeout in seconds
                output = future.result(timeout=5)
                status_code = 200
            except concurrent.futures.TimeoutError:
                output = "Code execution timed out."
                status_code = 408
        
        
        
        return {
            'statusCode': 200,
            'body': ''.join(output),
            'headers': headers,
            'isBase64Encoded': True,
        }
    except Exception as e:
        print("Error",str(e))
        return {
            'statusCode': 500,
            'body': str(e),
            'headers': headers,
            'isBase64Encoded': True,
        }