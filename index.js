require('dotenv').config()
const axios = require('axios');
var AWS = require('aws-sdk'); 
const fs = require('fs');

const path = require('path');
const express = require('express')
const app = express()
const rimraf = require('rimraf');

var exphbs  = require('express-handlebars');

// var expressWs = require('express-ws')(app);

var socket = require('socket.io')


const AWSAuthMiddleware = require('./src/middleware/AWSAuthMiddleware')

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'))

app.use(AWSAuthMiddleware)

var server = app.listen(process.env.SERVER_PORT, () => console.log(`App listening on port ${process.env.SERVER_PORT}!`))

// Socket Setup
var io = socket(server)

var cloudwatch = new AWS.CloudWatch();

const directoryPath = path.join(__dirname, 'public/images/');

// ----------------------------- DASHBOARD NAME ----------------------------- //
var db_name = 'Master'
// ----------------------------- DASHBOARD NAME ----------------------------- //

io.on('connection', function(socket) {
    console.log('connected web socket', socket.id)


    socket.on('updateAWS', async (data) => {
        console.log('updating aws index')

          await axios.get('http://localhost:5000/aws').then(function (response) {
            console.log(response)
          }).catch(err => {
              console.log(err.message)
          })


       var images = []
        fs.readdirSync(directoryPath).forEach(file => {
            images.push(file)
        })

        io.sockets.emit('updateAWS', images)

  

      
    })


})


app.get('/', (req, res) => res.send('Hello World!'))


async function getDashboard(DashboardName) {
    
    if (!DashboardName) { throw new Error('No Dashboard Name')}
    
    try {
        return await cloudwatch.getDashboard({DashboardName}).promise()
    } catch (error) {
        throw new Error(error.stack)
    }

}  

async function getMetricsFromDashboard(DashboardName) {
    if (!DashboardName) { throw new Error('No Dashboard Name')}

    const data = await getDashboard(DashboardName)

    let dataBody = JSON.parse(data.DashboardBody)
    const { widgets } = dataBody
   
   
    var metricsArr = []

    widgets.forEach(elem => {
        // console.log(elem)
        var { properties: { metrics, view } } = elem
        metricsArr.push({metrics, view})
    })
    
    return metricsArr

}

app.get('/aws', async  (req, res) => {

    const metrics = await getMetricsFromDashboard(db_name)

    rimraf('./public/images/*', function () { console.log('done'); });

    metrics.forEach( (data, index) => {

        var { metrics, view } = data
        
        var value =
            {
                "view": view,
                "stacked": false,
                "metrics": metrics,
                "region": "ca-central-1"
            }

        var params = {
            MetricWidget: JSON.stringify(value),
            OutputFormat: 'png'
        }
    
        cloudwatch.getMetricWidgetImage(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        
        else  {
            const { MetricWidgetImage} = data

            fs.writeFile(`./public/images/img${index}.png`, MetricWidgetImage);

            console.log(MetricWidgetImage)
         }    
        

        });
    })

    res.status(200)
    // res.status(200).send('done')

})

app.get('/display', (req, res) => {
    res.render('aws', {layout: false})
})



app.get('/metricdata', (req, res) => {


    var params = {
        EndTime: new Date,
        MetricDataQueries: [
            {
                
            }
        ],
        StartTime: new Date,
    }
    
    cloudwatch.getMetricData(params).then(data => {
        console.log('success')
        console.log(data)
    }).catch(error => {
        console.log(error.stack)
    })

})


