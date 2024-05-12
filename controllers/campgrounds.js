import Campground from '../models/campground.js';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
import { cloudinary } from '../cloudinary/index.js';

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

export default {
    index: async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds });
    },
    renderNewForm: (req, res) => {
        res.render('campgrounds/new');
    },
    createCampground: async (req, res, next) => {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.location,
            limit: 1
        }).send();
        const campground = new Campground(req.body);
        campground.geometry = geoData.body.features[0].geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', '캠핑장을 추가했습니다.');
        res.send({
            success: true,
            msg: '캠핑장을 추가했습니다.',
            id: campground._id
        });
    },
    showCampground: async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        if (!campground) {
            req.flash('error', '캠핑장을 찾을 수 없습니다.');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', { campground });
    },
    renderEditForm: async (req, res) => {
        const { id } = req.params;

        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash('error', '캠핑장을 찾을 수 없습니다.');
            return res.redirect('/campgrounds');
        }

        res.render('campgrounds/edit', { campground });
    },
    updateCampground: async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, req.body);
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...imgs);
        await campground.save();

        if (req.body.deleteImages) {
            if (typeof req.body.deleteImages === 'string') {
                await cloudinary.uploader.destroy(req.body.deleteImages);
                await campground.updateOne({ $pull: { images: { filename: req.body.deleteImages } } });
            } else {
                for (let filename of req.body.deleteImages) {
                    await cloudinary.uploader.destroy(filename);
                }
                await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
            }
        }

        req.flash('success', '캠핑장을 수정했습니다.');
        res.send({
            success: true,
            msg: '캠핑장을 수정했습니다.',
            id: id
        });
    },
    deleteCampground: async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', '캠핑장을 삭제했습니다.');
        res.send({
            success: true,
            msg: '캠핑장을 삭제했습니다.',
            id: id
        });
    }
}

