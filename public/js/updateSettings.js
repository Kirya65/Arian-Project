/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts'
//type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const tp = type === 'password' ? 'updatePassword' : 'updateMe'
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/users/${tp}`,
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} successfully updated!`);
    }

  } catch (err) {
    showAlert('error',err.response.data.message);
  }
};