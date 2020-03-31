/* eslint-disable */
import {showAlert} from './alerts'
import axios from 'axios';

export const login = async (email,password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            } 
        });
        console.log(res)
        if (res.data.status === 'success') {
            showAlert('success','Logged in succesfully');
            window.setTimeout(() => {
                location.assign('/')
            },1500);
        }
        // console.log(res);
    } catch(err)   {
        showAlert('error',err.response.data.message);
    }

}
export const logout = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:3000/api/v1/users/logout'
      });
      if ((res.data.status = 'success')) location.reload(true); //force reload the page from the server and not from the cache where still can be user menu. 
    } catch (err) {
      console.log(err.response);
      showAlert('error', 'Error logging out! Try again.');
    }
  };
  