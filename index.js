require('dotenv').config()
var AWS = require('aws-sdk'); 
const fs = require('fs');

const express = require('express')
const app = express()
const rimraf = require('rimraf');

var exphbs  = require('express-handlebars');

const AWSAuthMiddleware = require('./src/middleware/AWSAuthMiddleware')

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(express.static('public'))

app.use(AWSAuthMiddleware)

app.get('/', (req, res) => res.send('Hello World!'))


var cloudwatch = new AWS.CloudWatch();


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

    const metrics = await getMetricsFromDashboard('Master')

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

    res.status(200).send('done')

})

app.get('/display', (req, res) => {
    res.render('aws', {layout: false})
})

app.listen(process.env.SERVER_PORT, () => console.log(`App listening on port ${process.env.SERVER_PORT}!`))






// console.log(data)

// var cloudwatch = new AWS.CloudWatch();

// var params = {
//     MetricWidget: JSON.stringify({
//         "view": "timeSeries",
//         "stacked": false,
//         "metrics": [
//             [ "System/Linux", "DiskSpaceUsed", "MountPath", "/", "InstanceId", "i-0734d906f711ec41d", "Filesystem", "/dev/nvme0n1p1" ]
//         ],
//         "region": "ca-central-1"
//     }),
//     OutputFormat: 'png'
// }


// cloudwatch.getMetricWidgetImage(params, function (err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else  {
//     const { MetricWidgetImage} = data

//     fs.writeFile("img1.png", MetricWidgetImage);

//     res.send('done')

//     // res.send(MetricWidgetImage)
//     console.log(MetricWidgetImage)


//   }          
// });