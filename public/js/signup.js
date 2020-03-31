/* eslint-disable */
import {showAlert} from './alerts'
import axios from 'axios';

export const signup = async (email,name,password,passwordConfirm) => {
  try {
    console.log('I from signup!!')
    console.log(email,name,password,passwordConfirm)
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });
    console.log(res);
    if(res.data.status == 'success') {
      showAlert('success',`Welome to the Alian App`);
      console.log('succcessss!!!!!!!!!!');

      window.setTimeout(() => {
        location.assign('/')
      },1500);
    }
  }
  catch(err) {
    console.log(err.response.data)
    showAlert(err)
  }
}