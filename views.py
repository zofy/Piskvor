import tornado
from tornado import gen
from tornado.httpclient import AsyncHTTPClient

import WSHandler


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")


class GameHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("game.html", users=WSHandler.WSHandler.users)


class LoginHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.render("index.html")

    def post(self):
        self.set_secure_cookie("user", self.get_argument("nick"))
        self.redirect('/')


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.redirect("/")
