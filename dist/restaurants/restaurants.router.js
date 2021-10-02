"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantsRouter = void 0;
const model_router_1 = require("../common/model-router");
const restify_errors_1 = require("restify-errors");
const restaurants_model_1 = require("./restaurants.model");
const authz_handler_1 = require("../security/authz.handler");
class RestaurantsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(restaurants_model_1.Restaurant);
        this.findMenu = (req, resp, next) => {
            restaurants_model_1.Restaurant.findById(req.params.id, "+menu")
                .then(rest => {
                if (!rest) {
                    throw new restify_errors_1.NotFoundError('Restaurant not found');
                }
                else {
                    resp.json(rest.menu);
                    return next();
                }
            }).catch(next);
        };
        this.replaceMenu = (req, resp, next) => {
            restaurants_model_1.Restaurant.findById(req.params.id).then(rest => {
                if (!rest) {
                    throw new restify_errors_1.NotFoundError('Restaurant not found');
                }
                else {
                    rest.menu = req.body;
                    return rest.save();
                }
            }).then(rest => {
                resp.json(rest.menu);
                return next();
            }).catch(next);
        };
    }
    envelope(document) {
        let resource = super.envelope(document);
        resource._links.menus = `${this.basePath}/${resource._id}/menu`;
        return resource;
    }
    applyRoutes(application) {
        application.get(`/${this.basePath}`, this.findAll);
        application.get(`/${this.basePath}/:id`, [this.valedateId, this.findById]);
        application.post(`/${this.basePath}`, [authz_handler_1.authorize('admin'), this.save]);
        application.put(`/${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.valedateId, this.replace]);
        application.patch(`/${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.valedateId, this.update]);
        application.del(`/${this.basePath}/:id`, [authz_handler_1.authorize('admin'), this.valedateId, this.delete]);
        application.get(`/${this.basePath}/:id/menu`, [this.valedateId, this.findMenu]);
        application.put(`/${this.basePath}/:id/menu`, [authz_handler_1.authorize('admin'), this.valedateId, this.replaceMenu]);
    }
}
exports.restaurantsRouter = new RestaurantsRouter();