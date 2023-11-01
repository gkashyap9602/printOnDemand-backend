require("../db_functions")
let jwt = require('jsonwebtoken');
var helpers = require('../services/helper')
let Administration = require('../models/Administration');
let Users = require('../models/Users');
const ResponseMessages = require('../constants/ResponseMessages');
const consts = require("../constants/const")
const moment = require("moment")
let ObjectId = require('mongodb').ObjectID;

const middleware = {
	verifyToken: async (token) => {
		try {
			let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
			return jwt.verify(token, API_SECRET, async (err, decoded) => {
				if (err) {
					return helpers.showResponse(false, ResponseMessages?.middleware?.token_expired, null, null, 401);
				}
				if (decoded?.user_type == "user") {

					return helpers.showResponse(true, ResponseMessages?.users?.token_verification_sucess, decoded, null, 200);
				} else if (decoded?.user_type == "admin") {

					return helpers.showResponse(true, ResponseMessages?.users?.token_verification_sucess, decoded, null, 200);
				}
			})
		} catch (error) {
			console.log("in catch middleware check token error : ", error)
			return helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token, null, null, 401);
		}

	},
	verifyTokenBoth: async (req, res, next) => {
		try {
			let token = req.headers['access_token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

			if (!token) {
				return res.status(401).json({ status: false, message: "Something went wrong with token" });
			}
			if (token.startsWith('Bearer ')) {
				token = token.slice(7, token.length);
			}
			if (token) {
				let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })

				jwt.verify(token, API_SECRET, async (err, decoded) => {

					if (err) {
						return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
					}
					if (decoded?.type == "refresh") {
						return res.status(403).json({ status: false, message: ResponseMessages?.middleware?.use_access_token, StatusCode: 401 });
					}
					if (decoded?.user_type == "user") {
						let response = await getSingleData(Users, { _id: decoded._id }, { password: 0 });
						if (!response.status) {
							return res.status(401).json({ status: false, message: ResponseMessages?.users?.invalid_user, StatusCode: 401 });
						}
						let userData = response?.data
						if (userData.status == 0) {
							return res.status(423).json({ status: false, message: ResponseMessages?.middleware?.disabled_account, StatusCode: 423 });
						}
						if (userData.status == 3) {
							return res.status(451).json({ status: false, message: ResponseMessages?.middleware?.deactivated_account, StatusCode: 451 });
						}
						decoded = { ...decoded, user_id: userData._id }
						req.decoded = decoded;
						req.token = token
						next();
					} else if (decoded?.user_type == "admin") {
						let response = await getSingleData(Users, { _id: decoded._id }, { password: 0 });

						if (!response.status) {
							return res.status(401).json({ status: false, message: ResponseMessages?.users.invalid_user, StatusCode: 401 });
						}
						let adminData = response?.data
						if (adminData.status == 0) {
							return res.status(423).json({ status: false, message: ResponseMessages?.middleware?.disabled_account, StatusCode: 423 });
						}
						if (adminData.status == 3) {
							return res.status(451).json({ status: false, message: ResponseMessages?.middleware?.deactivated_account, StatusCode: 451 });
						}
						decoded = { ...decoded, admin_id: adminData._id }
						req.decoded = decoded;
						req.token = token
						next();
					}
				})
			} else {
				return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
			}
		} catch (err) {
			console.log("in catch middleware check token error : ", err)
			return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
		}
	},

	verifyTokenAdmin: async (req, res, next) => {
		try {
			let token = req.headers['access_token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

			if (!token) {
				return res.status(401).json({ status: false, message: "Something went wrong with token" });
			}
			if (token.startsWith('Bearer ')) {
				token = token.slice(7, token.length);
			}
			if (token) {
				let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })

				jwt.verify(token, API_SECRET, async (err, decoded) => {
					if (err) {
						return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
					}
					if (decoded?.type == "refresh") {
						return res.status(403).json({ status: false, message: ResponseMessages?.middleware?.use_access_token, StatusCode: 401 });
					}
					if (decoded?.user_type == "admin") {

						let response = await getSingleData(Users, { _id: decoded._id }, { password: 0 });

						if (!response.status) {
							return res.status(401).json({ status: false, message: ResponseMessages?.admin.invalid_admin, StatusCode: 401 });
						}
						let adminData = response?.data
						if (adminData.status == 0) {
							return res.status(423).json({ status: false, message: ResponseMessages?.middleware?.disabled_account, StatusCode: 423 });
						}
						if (adminData.status == 3) {
							return res.status(451).json({ status: false, message: ResponseMessages?.middleware?.deactivated_account, StatusCode: 451 });
						}
						decoded = { ...decoded, admin_id: adminData._id }
						req.decoded = decoded;
						req.token = token
						next();
					} else {
						return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.invalid_admin, StatusCode: 401 });

					}
				})
			} else {
				return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
			}
		} catch (err) {
			console.log("in catch middleware check token error : ", err)
			return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
		}
	},
	verifyTokenUser: async (req, res, next) => {
		try {
			let token = req.headers['access_token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

			if (!token) {
				return res.status(401).json({ status: false, message: "Something went wrong with token" });
			}
			if (token.startsWith('Bearer ')) {
				token = token.slice(7, token.length);
			}
			if (token) {
				let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })

				jwt.verify(token, API_SECRET, async (err, decoded) => {

					if (err) {
						return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
					}
					if (decoded?.type == "refresh") {
						return res.status(403).json({ status: false, message: ResponseMessages?.middleware?.use_access_token, StatusCode: 401 });
					}
					if (decoded?.user_type == "user") {
						let response = await getSingleData(Users, { _id: decoded._id }, { password: 0 });
						if (!response.status) {
							return res.status(401).json({ status: false, message: ResponseMessages?.users?.invalid_user, StatusCode: 401 });
						}
						let userData = response?.data
						if (userData.status == 0) {
							return res.status(423).json({ status: false, message: ResponseMessages?.middleware?.disabled_account, StatusCode: 423 });
						}
						if (userData.status == 3) {
							return res.status(451).json({ status: false, message: ResponseMessages?.middleware?.deactivated_account, StatusCode: 451 });
						}
						decoded = { ...decoded, user_id: userData._id }
						req.decoded = decoded;
						req.token = token
						next();
					}
					else {
						return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.invalid_user, StatusCode: 401 });
					}
				})
			} else {
				return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
			}
		} catch (err) {
			console.log("in catch middleware check token error : ", err)
			return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired, StatusCode: 401 });
		}
	},
	refreshToken: async (req, res) => {
		let requiredFields = ['access_token', 'refresh_token'];
		let validator = helpers.validateParams(req, requiredFields);
		if (!validator.status) {
			response = helpers.showResponse(false, validator.message)
			return res.status(203).json(response);
		}
		let { access_token, refresh_token } = req.body
		let API_SECRET = await helpers.getParameterFromAWS({ name: "API_SECRET" })
		jwt.verify(refresh_token, API_SECRET, async (err, decoded) => {
			if (err) {
				return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired });
			}
			if (decoded.type !== "refresh") {
				return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.use_refresh_token });
			}
			let user_type = decoded.user_type
			if (user_type === "user") {
				let result = await getSingleData(Users, { device_info: { $elemMatch: { access_token, refresh_token } } }, '')
				if (!result.status) {
					return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired });
				}
				let userData = result.data;
				if (userData.status == 0) {
					return res.status(451).json(helpers.showResponse(false, ResponseMessages?.middleware?.disabled_account));
				}
				if (userData.status == 3) {
					return res.status(423).json(helpers.showResponse(false, ResponseMessages?.middleware?.deactivated_account));
				}
				let new_token = jwt.sign({ user_type, type: "access" }, API_SECRET, {
					expiresIn: consts.ACCESS_EXPIRY
				});
				// now get device id of user
				let device_info = userData?.device_info
				let deviceObjIndex = device_info?.findIndex((di) => (di.access_token == access_token && di.refresh_token == refresh_token))
				if (deviceObjIndex < 0) {
					return res.status(423).json(helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token));
				}
				device_info = device_info?.map((di, index) => {
					if (index == deviceObjIndex) {
						return {
							...di._doc,
							access_token: new_token
						}
					} else {
						return di
					}
				})
				let editObj = {
					device_info,
					updated_on: moment().unix()
				}
				await updateData(Users, editObj, ObjectId(userData?._id))
				data = { access_token: new_token, refresh_token };
				return res.status(200).json(helpers.showResponse(true, ResponseMessages?.middleware?.access_refreshed, data));
			} else if (user_type === 'admin') {
				let result = await getSingleData(Administration, { device_info: { $elemMatch: { access_token, refresh_token } } }, '')
				if (!result.status) {
					return res.status(401).json({ status: false, message: ResponseMessages?.middleware?.token_expired });
				}
				let adminData = result.data;
				if (adminData.status == 0) {
					return res.status(451).json(helpers.showResponse(false, ResponseMessages?.middleware?.disabled_account));
				}
				if (adminData.status == 3) {
					return res.status(423).json(helpers.showResponse(false, ResponseMessages?.middleware?.deactivated_account));
				}
				let new_token = jwt.sign({ user_type, type: "access" }, API_SECRET, {
					expiresIn: consts.ACCESS_EXPIRY
				});
				// now get device id of user
				let device_info = adminData?.device_info
				let deviceObjIndex = device_info?.findIndex((di) => (di.access_token == access_token && di.refresh_token == refresh_token))
				if (deviceObjIndex < 0) {
					return res.status(423).json(helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token));
				}
				device_info = device_info?.map((di, index) => {
					if (index == deviceObjIndex) {
						return {
							...di._doc,
							access_token: new_token
						}
					} else {
						return di
					}
				})
				let editObj = {
					device_info,
					updated_on: moment().unix()
				}
				await updateData(Administration, editObj, ObjectId(adminData?._id))
				data = { access_token: new_token, refresh_token };
				return res.status(200).json(helpers.showResponse(true, ResponseMessages?.middleware?.access_refreshed, data));
			} else {
				return res.status(401).json(helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token));
			}
		})
	},
	// validate CSRF token middleware
	validateCSRFToken: async (req, res, next) => {

		let token = req.headers['access_token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
		console.log(token, "user jwt token csrf");
		if (!token) {
			return res.status(401).json({ status: false, message: "Something went wrong with token" });
		}
		if (token.startsWith('Bearer ')) {
			token = token.slice(7, token.length);
		}
		//get csrf token from headers
		let csrfTokenUser =  req.get('xCsrf_Token')

		console.log(req.headers,"req.headerss==");
		// req.headers['xCsrf_Token']
		// req.get('xCsrf_Token')

		console.log(csrfTokenUser, "csrfTokenUser validateCSRFToken");
		if (!csrfTokenUser) {
			return res.status(403).send({ message: 'CSRF Token Not Provide By User' })
		}

		let verifiedUser = await middleware.verifyToken(token)
		console.log(verifiedUser, "verified users");
		if (!verifiedUser.status) {
			return res.status(401).json({ status: false, message: "Invalid user" });
		}
		let decoded = verifiedUser?.data
		//after verified Jwt Token check user Type and verify Csrf Token 
		if (decoded.user_type == "user") {
			let response = await getSingleData(Users, { _id: decoded._id }, { password: 0 });
			if (!response.status) {
				return res.status(401).json({ status: false, message: ResponseMessages?.users?.invalid_user, StatusCode: 401 });
			}
			let userData = response?.data
			//check csrf token is valid or not
			if (userData.csrfToken !== csrfTokenUser) {
				return res.status(403).json({ status: false, message: 'Invalid Csrf Token', StatusCode: 403 });
			}
			if (userData.status == 0) {
				return res.status(423).json({ status: false, message: ResponseMessages?.middleware?.disabled_account, StatusCode: 423 });
			}
			if (userData.status == 3) {
				return res.status(451).json({ status: false, message: ResponseMessages?.middleware?.deactivated_account, StatusCode: 451 });
			}
			decoded = { ...decoded, user_id: userData._id }
			req.decoded = decoded;
			req.token = token
			next()
		} else if (decoded?.user_type == "admin") {
			let response = await getSingleData(Users, { _id: decoded._id }, { password: 0 });

			if (!response.status) {
				return res.status(401).json({ status: false, message: ResponseMessages?.admin.invalid_admin, StatusCode: 401 });
			}
			let adminData = response?.data
			console.log(adminData.csrfToken, "admin csrftoken");
			if (adminData.csrfToken !== csrfTokenUser) {
				return res.status(403).json({ status: false, message: 'Invalid Csrf Token', StatusCode: 403 });
			}
			if (adminData.status == 0) {
				return res.status(423).json({ status: false, message: ResponseMessages?.middleware?.disabled_account, StatusCode: 423 });
			}
			if (adminData.status == 3) {
				return res.status(451).json({ status: false, message: ResponseMessages?.middleware?.deactivated_account, StatusCode: 451 });
			}
			decoded = { ...decoded, admin_id: adminData._id }
			req.decoded = decoded;
			req.token = token
			next();
		}
	},

}

module.exports = {
	...middleware
}