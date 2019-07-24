'use strict';
const emailRegExp = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

const hideNode = (node, bool) => bool
  ? node.classList.remove('hidden')
  : node.classList.add('hidden');

window.onload = function(){
  let state = {};

  const form = document.querySelector('.authorization-form');
  const profile = document.querySelector('.profile');

  class AuthorizationForm {
    constructor(form, display) {
      this.form = form;
      this.logInBtn = form.querySelector('.authorization-form__btn');
      this.email = form.querySelector('input[type=email]');
      this.password = form.querySelector('input[type=password]');
      this.errorField = form.querySelector('.authorization-form__error');

      this.initForm(display);
    }

    initForm = (display) => {
      hideNode(this.form, display);

      this.email.value = '';
      this.email.classList.remove('input-error');

      this.password.classList.remove('input-error');
      this.password.value = '';

      this.errorField.classList.add('hidden');

      this.logInBtn.onclick = this.login;
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
        .then(data => {console.log(data);
          if(data.error) throw Error(data.error);
          return state = {authorized: true, ...data}})
        .then(() => render())
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
    constructor(profile, display) {
      this.profile = profile;
      this.logOutBtn = profile.querySelector('.authorization-form__btn');
      this.photo = profile.querySelector('.profile__photo');
      this.name = profile.querySelector('.profile__name');

      this.initForm(display);
    }

    initForm = (display) => {
      hideNode(this.profile, display);
      this.logOutBtn.onclick = this.logout;
      if (state.authorized) this.createProfile()
    };

    logout = () => setInitialState();

    createProfile = () => {
      this.photo.src = state.photoUrl;
      this.name.innerText = state.name;
    }
  }

  function render() {
    new AuthorizationForm(form, !state.authorized);
    new Profile(profile, state.authorized)
  }

  const setInitialState = () => {
    state = {
      authorized: false,
      name: '',
      photoUrl: ''
    };

    render()
  };

  setInitialState()
};