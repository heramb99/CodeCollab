const handler = async (event) => {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
    };
    try {
        
            // Extract JavaScript code from the event
        const parsed_event = JSON.parse(event.body);

        const javascriptCode = parsed_event.code
            // Capture console.log output
            let logs = [];
            const logInterceptor = (output) => logs.push(output);
            console.log = logInterceptor;
            
            // Execute the JavaScript code
            eval(javascriptCode);
            
            // Restore console.log
            console.log = console._log;
            
            // Return the captured output
            return {
                'statusCode': 200,
                'body': logs.join('\n'),
                'headers':headers,
                'isBase64Encoded':true
            };
        } catch (error) {
            return {
                'statusCode': 500,
                'body': error.message,
                'headers':headers,
                'isBase64Encoded':true
            }
        }
};
module.exports = {
    handler
};