var router = require('express').Router();
var passport = require('passport');
var FB = require('fb');
<<<<<<< HEAD
var vine = require('../test/vine.js');
var instagram = require('../test/ig.js');
=======
var ig = require('instagram-node').instagram()
var facebook = require('../facebook-test.js')
>>>>>>> facebook



var socialFunctions = require('../social');
var getYoutubeData = socialFunctions.getYoutubeData;
var getDay = socialFunctions.getDay;
var getWeek = socialFunctions.getWeek;
var getMonth = socialFunctions.getMonth;
var getYear = socialFunctions.getYear;

/* GET home page. */
router.get('/', function(req, res, next) {

	res.render('index', { title: 'Express' });
});


router.get('/integrate', function(req, res, next) {
	res.render('integrate');
});

router.get('/fbPageSelector', function(req, res, next) {
	console.log("REQ ", req.user.facebook.token);
	
	new Promise(function(resolve, reject){

		FB.setAccessToken(req.user.facebook.token);

		console.log("REQ ", req.user.facebook.id);

		FB.api('/'+req.user.facebook.id+'/accounts', function (res) { //takes facebook user id and gets pages that they administer
			if(!res || res.error) {
				console.log(!res ? 'error occurred' : res.error);
				reject(res.error);
			}
			console.log("here3")
			resolve(res);
		});
	})
	.then((result) => {
		console.log('here2')
		res.render('fbPageSelector', {result: result.data})
	})
	.catch(console.log)
});

//GETS PAGE DATA FROM INDIVIDUAL FACEBOOK PAGE
router.get('/fbPageConfirmation/', function(req, res, next) {
	if (req.query.pageId) {
		FB.setAccessToken(req.user.facebook.token);
		console.log("~~~~~~~~~~~~~~~~~~~~ ",req.query);
		console.log("~~~~~~~~XXXXXXXX~~~~~~~ ",req.user.facebook.pages);
		req.user.facebook.pages.push({pageId: req.query.pageId, pageName: req.query.name})
		console.log("~~~~~~~~XXXXXXXX~~~~~~~ ",req.user.facebook.pages);
		req.user.save(function(err, success){
			console.log("Running")
			if(err){
				console.log("ERROR ", err)
			}
			console.log("YO BITCH",success)
		});
		res.render('fbPageSelector', {result: result})
		
	}
	
})
//dashboard and dashboard/id that takes id of each client user
// update route that always pings 
router.get('/dashboard', function(req, res, next){
	// executing all 'get data/statistics'
	FB.setAccessToken(req.user.facebook.token);
	var test = facebook.time(3);

router.get('/update', (req, res, next) => {
  var socialPromises = Object.keys(socialFunctions).map((socialFunction) => {
    return socialFunctions[key]();
  });

  Promise
    .all(socialPromises)
    .then((allTheDataEver) => {
      console.log("[all the data like ever]", allTheDataEver);
    })
    .catch(console.log.bind(this, "[social function err]"));
})


router.get('/youtube', function(req, res, next) {
  getYoutubeData(req.user.youtube.profile.id)
  .then((data) => {
    // console.log('[ALL VIDEOS]', data.videos);
    var daydata = getDay(data.videos);
    var weekdata = getWeek(data.videos);
    var monthdata = getMonth(data.videos);
    var yeardata = getYear(data.videos);
    res.render('youtube', {
      channelName: req.user.youtube.profile.displayName,
      channel: data.channel,
      daydata,
      weekdata,
      monthdata,
      yeardata
    })
  })
})
	res.render('dashboard')

})


router.get('/update', (req, res, next) => {

	updateFacebook()
	.then(() => updateInstagram(req.user))
	.then(() => updateYoutube)
	.then(() => updateTwitter)
	.then(() => updateVine)
	.catch(console.log);

})



module.exports = router;
