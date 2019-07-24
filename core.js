'use strict';
const emailRegExp = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

const hideNode = (node, bool) => bool
  ? node.classList.remove('hidden')
  : node.classList.add('hidden');

class AuthorizationForm {
  constructor(form, setState) {
    this.form = form;
    this.logInBtn = form.querySelector('.authorization-form__btn');
    this.email = form.querySelector('input[type=email]');
    this.password = form.querySelector('input[type=password]');
    this.errorField = form.querySelector('.authorization-form__error');

    this.callback = setState;
    this.logInBtn.onclick = this.login;
  }

  initForm = (display) => {
    hideNode(this.form, display);

    this.email.value = '';
    this.email.classList.remove('input-error');

    this.password.classList.remove('input-error');
    this.password.value = '';

    this.errorField.classList.add('hidden');
  };

  validateForm =() => {
    this.email.classList.remove('input-error');
    this.password.classList.remove('input-error');
    this.errorField.classList.add('hidden');

    if (!this.email.value || !emailRegExp.test(this.email.value)) {
      this.email.classList.add('input-error');
      return "E-Mail is incorrect";
    }
    if (!this.password.value) {
      this.password.classList.add('input-error');
      return 'Password has required';
    }
  };

  displayError = (error) => {
    this.errorField.innerText = error;
    this.errorField.classList.remove('hidden');
  };

  login = () => {
    const error = this.validateForm();

    if (error) return this.displayError(error);

    this.sendRequest()
      .then(data => {
        if(data.error) throw Error(data.error);
        return this.callback({authorized: true, ...data})})
      .catch(error => this.displayError(error))
  };

  sendRequest = () => {
    const url = 'https://us-central1-mercdev-academy.cloudfunctions.net/login';
    const user = JSON.stringify({
      email: this.email.value,
      password: this.password.value
    });

    return fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: user
    })
      .then(res => res.json())
  }
}

class Profile {
  constructor(profile, setInitialState) {
    this.profile = profile;
    this.logOutBtn = profile.querySelector('.authorization-form__btn');
    this.photo = profile.querySelector('.profile__photo');
    this.name = profile.querySelector('.profile__name');
    this.logOutBtn.onclick = this.logout;

    this.callback = setInitialState;
    this.currentState = {};
  }

  initForm = (display, state) => {
    hideNode(this.profile, display);
    this.currentState = state;
    if (this.currentState.authorized) this.createProfile()
  };

  logout = () => this.callback();

  createProfile = () => {
    this.photo.src = this.currentState.photoUrl;
    this.name.innerText = this.currentState.name;
  }
}

window.onload = function(){
  let state = {};

  const setInitialState = () => {
    state = {
      authorized: false,
      name: '',
      photoUrl: ''
    };

    render()
  };

  function setState(newState) {
    state = {
      ...newState
    };
    render()
  }

  const form = new AuthorizationForm(document.querySelector('.authorization-form'), setState);
  const profile = new Profile(document.querySelector('.profile'), setInitialState);

  function render() {
    form.initForm(!state.authorized);
    profile.initForm(state.authorized, state);
  }

  setInitialState();
};