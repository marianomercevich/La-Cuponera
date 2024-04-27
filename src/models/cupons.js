import mongoose from 'mongoose';

const { Schema } = mongoose;

const couponSchema = new Schema({
  title: {type: String, required: true},
  description: { type: String, required: true},
  discount: {type: Number, required: true},
  location: {type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }},
  expirationDate: {type: Date, required: true },
  createdBy: {type: Schema.Types.ObjectId,ref: 'Empresa'}, // Referencia al modelo de empresas creadoras de cupones
  createdAt: {type: Date, default: Date.now}
});

couponSchema.index({ location: '2dsphere' }); // Índice geoespacial para la ubicación del cupón

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;