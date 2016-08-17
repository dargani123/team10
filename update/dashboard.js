var models = require('../models/models');
var User = models.User;
var Profile = models.Profile;
var ProfileSnapshot = models.ProfileSnapshot;
var Post = models.Post;
var PostSnapshot = models.PostSnapshot;

function getGeneral(id) { //chanel info for each function
	return new Promise(function(masterResolve, masterReject) {
		var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
		Profile.findOne({userId: id}, function(err, profile) {
			if (err) return console.log(err);
			platforms = platforms.map(function(p) {
				return new Promise(function(resolve, reject) {
					ProfileSnapshot.find({profileId: profile._id, platform: p})
					.limit(10)
					.exec(function(err, psnaps) {
						if (err) reject(err);
						var followers = [];
						psnaps.forEach(function(psnap) {
							followers.push(psnap.followers);
						})
						resolve({
							type: p,
							data: psnaps,
							profile,
							followers
						});
					});
				});
			});

			Promise
			.all(platforms)
			.then((results) => {
				snaps = {};
				followers = {};
				change = {};
				recent = results[0].profile
				results.forEach(function(result, i) {
					snaps[result.type] = result.data;
					followers[result.type] = result.followers;
				});
				// console.log('recent recent recent........', recent)
				
				masterResolve({
					snaps: snaps,
					followers: followers,
					recent: recent,
					change: change
				})
			}).catch((err) => console.log(err));
		});
	});
}

function getPosts(id) {
	return new Promise(function(masterResolve, masterReject) {
		var platforms = ['youtube', 'instagram', 'vine', 'twitter', 'facebook'];
		Profile.findOne({userId: id}, function(err, profile) {
			if (err) return masterReject(err);
			platforms = platforms.map(function(p) {
				return new Promise(function(resolve, reject) {
					Post.find({profileId: profile._id, type: p})
					.sort({'date': -1})
					.populate('snapshots')
					.lean() //changes mongoose object into normal data
					.exec(function(err, posts) {
						if (err) reject(err);

						var growth = posts.map((post) => {
							var growth = {};
							snaps = post.snapshots;
							// console.log('what does this look like.........', post)
							for (var key in snaps[0]) {
								// console.log('what the fuck does this look like............', key)
								if (!growth[key]) {
									// there are not enough snapshots
									// 0 in the denominator and numerator
									if (parseInt(snaps[snaps.length - 1][key]) === 0 && parseInt(post[key]) === 0) {
										growth[key] = 0;
									// 0 in the denominator
									} else if (parseInt(snaps[snaps.length - 1][key]) === 0) {
										growth[key] = 100
									// most recent update minus second to last snapshot
									} else {
										// console.log('did i get in here?............')
										growth[key] = parseInt((parseInt(post[key]) - parseInt(snaps[snaps.length - 1][key])) / parseInt(snaps[snaps.length - 1][key]) * 100)
									}
								}
							}
							// console.log('growth growth growth...........', growth);
							return growth;
						});

						resolve({
							type: p,
							posts: posts.map((post) => {
								var d = new Date(post.date)
								// console.log("Unix Date", post.description, post.date) //twitter and vine unix might be off
								post.date = (d.getMonth()+1) + '/' + d.getDate() + '/'+d.getFullYear();
								// console.log("POST Date after conversion",post.date)
								return post
							}),
							growth: growth
						});
					});
				});
			});
			Promise
			.all(platforms)
			.then((data) => {
				var stats = {};
				data.forEach(function(d) {
					if (!stats[d.type]) {
						stats[d.type] = {
							posts: d.posts.map((item, i) => { return [item, d.growth[i]]})
						};
					}
				})
				masterResolve(stats);
			}).catch((err) => console.log(err));
		});
	});
}

function checkAdmin(user) {
	return new Promise(function(resolve, reject) {
		if(user.isAdmin) {
			User.find((err, users) => {
				if (err) return reject(err);
				var userArray = users.map((user) => {return {id: user._id, username: user.username}})
				resolve(userArray)
			});
		} else {
			resolve([]);
		}
	});
}

function getPlatformPosts(id, platform) {
	return new Promise(function(resolve, reject) {
		Profile.findOne({userId: id}, function(err, profile) {
			if (err) return reject(err);
			ProfileSnapshot.find({platform: platform, profileId: profile._id}, function(err, profileSnaps) {
				if (err) return reject(err);
				// console.log('snap snap snap..........', profileSnaps);
				Post.find({type: platform, profileId: profile._id})
				.sort({'date': -1})
				.limit(6)
				.populate('snapshots')
				.lean()
				.exec(function(err, posts) {
					if (err) return reject(err);
					// console.log('post post post..........', Object.keys(posts[0].snapshots[0]));
					// res.send('hi')
					var change = posts.map((post) => {
						var change = {};
						var snaps = post.snapshots;
						for (var key in snaps[0]) {
							if (!change[key]) {
								// console.log('key key key key key key..........', key)
								change[key] = [];
								for (var i = 0; i < snaps.length; i++) {
									change[key].push(snaps[i][key]);
								}
							}
						}
						// console.log('change change change change........', change);
						return change;
					});
					resolve({
						posts: posts.map((post) => {
							var d = new Date(post.date);
							post.date = (d.getMonth()+1) + '/' + d.getDate() + '/'+d.getFullYear();
							return post;
						}),
						change: change
					});
				});
			});
		});
	});
}

module.exports = {
	getPosts: getPosts,
	getGeneral: getGeneral,
	checkAdmin: checkAdmin,
	getPlatformPosts: getPlatformPosts
}