import { FILE_TYPE } from '../redux/types/user.type';

export const compareSizes = (sizes1, sizes2) => {
  const m1 = +sizes1.split('px')[0];
  const m2 = +sizes2.split('px')[0];
  if (m1 < m2) return -1;
  else if (m1 === m2) return 0;
  return 1;
};

export const getTimeFromDate = (date) => {
  const time = new Date(date);
  let minutes = time.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  let hours = time.getHours();
  if (hours < 10) {
    hours = `0${hours}`;
  }
  return `${hours}:${minutes}`;
};

export const getFirstLetters = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return `${names[0].charAt(0).toUpperCase()}${names[names.length - 1]
    .charAt(0)
    .toUpperCase()}`;
};

export const getPreviewImage = (file) => {
  const image = URL.createObjectURL(file);
  return image;
};

export const getLinkDownloadFile = (url) => {
  // Tách đường dẫn thành các phần
  const parts = url.split('/');
  // Tìm chỉ số của phần chứa 'upload'
  const uploadIndex = parts.findIndex((part) => part === 'upload');
  // Kiểm tra xem có 'upload' trong đường dẫn không
  if (uploadIndex !== -1) {
    // Chèn tham số fl_attachment vào sau phần 'upload'
    parts.splice(uploadIndex + 1, 0, 'fl_attachment');
    // Tạo đường dẫn mới từ các phần đã chỉnh sửa
    const newUrl = parts.join('/');
    return newUrl;
  } else {
    // Trả về URL ban đầu nếu không tìm thấy phần 'upload'
    return url;
  }
};

export const getDataFromStringifyFile = (stringifyFile) => {
  try {
    const file = JSON.parse(stringifyFile);
    return file;
  } catch (error) {
    return null;
  }
};

export const customizeFile = (file) => {
  const newFile = { ...file };
  delete newFile.type;
  newFile.size = `${file.size} bytes`;
  newFile.name = file.name.split('.')[0];
  const ext = file.name.split('.')[1];
  if (ext === 'docx') {
    newFile.type = FILE_TYPE.WORD;
  } else if (ext === 'xlsx') {
    newFile.type = FILE_TYPE.EXCEL;
  } else if (ext === 'pdf') {
    newFile.type = FILE_TYPE.PDF;
  }
  return newFile;
};

export const accessTimeBefore = (time) => {
  const currentTime = new Date();
  const timeBefore = new Date(time);
  const timeDiff = currentTime - timeBefore;
  const seconds = timeDiff / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  if (days >= 1) {
    return `${Math.floor(days)} ngày trước`;
  } else if (hours >= 1) {
    return `${Math.floor(hours)} giờ trước`;
  } else if (minutes >= 1) {
    return `${Math.floor(minutes)} phút trước`;
  } else {
    return 'Vừa xong';
  }
};
