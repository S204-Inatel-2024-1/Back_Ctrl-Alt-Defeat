const http = require('http')
const fs = require('fs')
const port = 3000

const server = http.createServer(function(request, response){
    response.writeHead(200, {'content-type': 'text/html'})
    fs.readFile('Index.html', function(error, data){
        if(error){
            response.writeHead(404)
            response.write('Error: file not found')
        }
        else{
            response.write(data)
        }
        response.end
    })
})

server.listen(port, function(error){
    if(error){
        console.log('Something went wrong', error)
    }
    else{
        console.log('Server is listening on port ' + port)
    }
})