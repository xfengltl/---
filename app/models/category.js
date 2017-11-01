// Example model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    created: { type: Date }
});

CategorySchema.virtual('date')
  .get(() => this._id.getTimestamp());

mongoose.model('Category', CategorySchema);

