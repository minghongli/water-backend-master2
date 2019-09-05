import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const brandSchema = new Schema({
    name:"",
	sequence: Number,//序号
	created_at: {
		type: Date,
		default: new Date()
	},
})
brandSchema.index({
	id: 1
});
const brand = mongoose.model('Brand', brandSchema)
