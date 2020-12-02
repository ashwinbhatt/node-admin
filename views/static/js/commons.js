const url_base = document.currentScript.getAttribute('url_base')


function alertDisplay(message, time = 3000) {
	var ele = document.getElementById('alertDialogue');
	ele.innerHTML = message
	ele.hidden = false
	ele.style.textAlign= 'center'
	setTimeout((element) => {
		element.innerHTML = '';
		ele.hidden = true
	}, time, ele);
}



// =====================================LOGIN PAGE===================================================




function loginReq() {

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	var userEle = document.getElementById('username'), passEle = document.getElementById('password');

	fetch(window.location.href, {
		method: 'POST',
		headers: myHeaders,
		body: JSON.stringify({
			"username": userEle.value,
			"password": passEle.value
		}),
		redirect: 'follow'
	}).then(response => {
		if (!response.ok) {
			throw response.json()
		}
		return response.json()
	}).then(result => {
		console.log(result.message)
		document.location.href = 'http://' + document.location.host + result.redirect
	}).catch(error => {
		Promise.resolve(error).then(res => {
			if (!res.error) {
				alertDisplay('Something went wrong')
				console.log('Something went wrong')
			} else {
				alertDisplay(res.error)
				console.log(res.error)
			}
		})
	});
}

//=====================================================================================================
//====================================delete===========================================================

function updateList(usersData) {
	var select = document.getElementById('username');
	usersData.forEach((userData, index) => {
		var opt = userData.username;
		var el = document.createElement("option");
		el.setAttribute('id', 'username_' + index)
		el.textContent = opt;
		el.value = opt;
		select.appendChild(el);
	});
}

function autoFillForm(userdata) {
	setRole(userdata.role)
}

function setTriggers(usersData) {
	var activities = document.getElementById('username')
	activities.addEventListener("change", function () {
		if (activities.value == 'Username') {
			console.log(usersData.value)
			autoFillForm({ role: 'null' })
		} else {
			usersData.forEach(userData => {
				if (userData.username == activities.value) {
					autoFillForm(userData)
				}
			})
		}
	});
}


function getDataReq() {
	var usersData = undefined;
	fetch('http://' + document.location.host + url_base + '/users', {
		method: 'GET',
		headers: new Headers(),
		redirect: 'follow'
	}).then(response => {
		if (!response.ok) {
			throw response.json()
		}
		return response.json()
	}).then(result => {
		console.log(result.message)
		usersData = result.usersData
		updateList(usersData)
		return
	}).then(() => {
		setTriggers(usersData)
	}).catch(error => {
		console.log(error)
	});
}

function deleteReq() {
	var userEle = document.getElementById('username');
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");


	if (userEle.value == 'Username') {
		console.log('User not selected')
		alertDisplay('User not selected')
		return
	}
	fetch(window.location.href, {
		method: 'DELETE',
		headers: myHeaders,
		body: JSON.stringify({
			"username": userEle.value
		}),
		redirect: 'follow'
	}).then(response => {
		if (!response.ok) {
			throw response.json()
		}
		return response.json()
	}).then(result => {
		alertDisplay('Succesfully deleted user')
	}).catch(error => {
		Promise.resolve(error).then(res => {
			if (!res.error) {
				alertDisplay('Something went wrong')
				console.log('Something went wrong')
			} else {
				alertDisplay(res.error)
				console.log(res.error)
			}
		})
	})
}

//=====================================================================================================
//====================================Signup===========================================================

function signupReq() {
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	var username = document.getElementById('username').value,
		password = document.getElementById('password').value,
		role = getRole();

	
	if(!username || username.length==0|| !password || password.length==0 || !role || role.length==0){
		console.log('Fill all the fields')
		alertDisplay('Fill all the fields')
		return
	}

	
	fetch(window.location.href, {
		method: 'POST',
		headers: myHeaders,
		body: JSON.stringify({
			"username": username,
			"password": password,
			"role": role
		}),
		redirect: 'follow'
	}).then(response => {
		if (!response.ok) {
			throw response.json()
		}
		return response.json()
	}).then(result => {
		console.log(result.message)
		alertDisplay(result.message)
	}).catch(error => {
		Promise.resolve(error).then(res => {
			// console.log(res)
			if (!res.error) {
				alertDisplay('Something went wrong')
				console.log('Something went wrong')
			} else {
				alertDisplay(res.error)
				console.log(res.error)
			}
		})
	});
}

//=====================================================================================================
//====================================Update===========================================================


function setRole(value) {

	document.getElementById('r1').checked = false;
	document.getElementById('r2').checked = false;
	document.getElementById('r3').checked = false;

	if (document.getElementById('r1').value == value) {
		document.getElementById('r1').checked = true;
	} else if (document.getElementById('r2').value == value) {
		document.getElementById('r2').checked = true;
	} else if (document.getElementById('r3').value == value) {
		document.getElementById('r3').checked = true;
	}
}

function getRole() {
	if (document.getElementById('r1').checked == true) {
		return 'admin';
	} else if (document.getElementById('r2').checked == true) {
		return 'subadmin';
	} else if (document.getElementById('r3').checked == true) {
		return 'tourist';
	}
}

function updateReq() {

	const user = {
		username: username.value,
		role: getRole()
	}

	if (!user.role || user.role.length == 0) {
		console.log('Select proper user')
		alertDisplay('Select proper user')
		return
	}

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	var requestOptions = {
		method: 'PUT',
		headers: myHeaders,
		body: JSON.stringify({ user: user }),
		redirect: 'follow'
	};



	fetch(window.location.href, requestOptions)
		.then(response => {
			if (!response.ok) {
				throw response.json()
			}
			return response.json();
		}).then(result => {
			console.log(result.message)
			alertDisplay(result.message)
			return
		}).catch(error => {
			Promise.resolve(error).then(res => {
				if (!res.error) {
					alertDisplay('Something went wrong')
					console.log('Something went wrong')
				} else {
					alertDisplay(res.error)
					console.log(res.error)
				}
			})
		})
}


//=====================================================================================================
//====================================UserPage===========================================================

function logoutReq() {

	var logout_url = 'http://' + document.location.host + url_base + '/logout';
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");

	fetch(logout_url, {
		method: 'POST',
		headers: myHeaders
	}).then(response => {
		return response.json();
	}).then(result => {
		console.log(result.message);
		document.location.href = 'http://' + document.location.host + result.redirect;
	}).catch(err => {
		Promise.resolve(error).then(res => {
			if (!res.error) {
				alertDisplay('Something went wrong')
				console.log('Something went wrong')
			} else {
				alertDisplay(res.error)
				console.log(res.error)
			}
		})
	});
}

//=====================================================================================================
//====================================UserUpdate===========================================================



function updatePassReq() {

	var passEle = document.getElementById('password'),
		rePassEle = document.getElementById('rePassword');

	if (passEle.value != rePassEle.value) {
		console.log('Password Do not match')
		alertDisplay('Password Do not match')
		return;
	}


	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");

	var raw = JSON.stringify({ user: { "password": passEle.value } });

	var requestOptions = {
		method: 'PUT',
		headers: myHeaders,
		body: raw,
		redirect: 'follow'
	};

	fetch(document.location.href, requestOptions).then(response => {
		if (!response.ok) {
			throw response.json()
		}
		return response.json();
	}).then(result => {
		console.log(result.message)
		alertDisplay(result.message)
		return
	}).catch(error => {
		Promise.resolve(error).then(res => {
			if (!res.error) {
				alertDisplay('Something went wrong')
				console.log('Something went wrong')
			} else {
				alertDisplay(res.error)
				console.log(res.error)
			}
		})
	})
}

//================================================================================================