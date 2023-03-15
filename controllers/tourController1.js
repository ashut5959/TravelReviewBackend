const fs = require('fs');

const tours = JSON.parse(fs.readFileSync('./files/tour-samples.json'));

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'bad requrest',
      message: 'enter name and price',
    });
  next();
}

exports.checkId = (req, res, next, val) => {
  console.log(`tour is is: ${val}`);
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({
      status: 'failure',
      message: 'content not found',
    });
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requrestAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  // if (tours.length <= id)
  // if (!tour)
  //   res.status(404).json({ status: 'failure', message: 'content not found' });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.addTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile('./files/tour-samples.json', JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        tours: newTour,
      },
    });
  });
};

exports.updateTour = (req, res) => {
  // if (req.params.id * 1 > tours.length)
  //   res.status(404).json({
  //     status: 'failure',
  //     message: 'content not found',
  //   });

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here....>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
