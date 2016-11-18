// url (required), options (optional)
fetch('http://192.168.1.200:3000/nodes/rpi_hub/reading', {
	method: 'get'
}).then(function(response) {
  console.log(response);
}).catch(function(err) {
	console.warn(err);
});

/*

var chart = new Chartist.Line('.ct-chart', {
  series: [
    {
      name: 'temperature',
      data: readingsTemperature
    },
    {
      name: 'humidity',
      data: readingsHumidity
    }
  ]
}, {
  axisX: {
    type: Chartist.FixedScaleAxis,
    divisor: 5,
    labelInterpolationFnc: function(value) {
      return moment(value).format('MMM D');
    }
  }
});
*/
