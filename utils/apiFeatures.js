class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1 a) Filtering
    const queryObj = { ...this.queryString }; //таким образом мы копируем обьект а не создаем на него ссылку. Мы сначало деструктуризируе его, и все поля с значения переносим в новый обьект
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //1 b)Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // нам нужно заменить простое gte $gte чтоб можно было проводить фильтрацию
    // { duration: { gte: '5' } } -> { duration: { $gte: '5' } }
    // gte,gt,lte,lt
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //разделяем запятой и соединяем пробелом наш query
      // В Postmen для множественной сортировки мы ставим запятую: ?sort=price,duration
      //но mongoose єто понимает как: sort('price ratingsAverage') сначало будет сортировка price потом ratingsAverage
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    //3) Field Limiting
    if (this.queryString.fields) {
      const limit = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(limit);
    } else {
      this.query = this.query.select('-__v'); // '-'перед __v означает exclude с response,то есть мы не увидим это поле в response, но не удаляем его!
    }

    return this;
  }

  paginate() {
    //4)Pagination
    const page = this.queryString.page * 1 || 1; //convert string to a num by multypling on 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10, 1-10 : page1, 11-20 page2, 21 -30: page3...
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
