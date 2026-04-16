import axiosInstance from './axiosInstance';

export const uploadCV = (file) => {
  const formData = new FormData();
  formData.append('cv', file);
  return axiosInstance
    .post('/upload/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return axiosInstance
    .post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};

export const deleteFile = (publicId, resourceType) =>
  axiosInstance
    .delete('/upload', { data: { publicId, resourceType } })
    .then((res) => res.data);
