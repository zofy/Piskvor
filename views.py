import tornado
from tornado import gen
from tornado.httpclient import AsyncHTTPClient

from WSHandler import WSHandler


class UserHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

    def post(self):
        print('New player: ' + self.get_argument('nick'))
        WSHandler.users.append(self.get_argument('nick'))
        self.redirect('/game')


class GameHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("game.html", users=WSHandler.users)


class LoginHandler(tornado.web.RequestHandler):
    @gen.coroutine
    def get(self):
        http_client = AsyncHTTPClient()
        response = yield gen.sleep(10)
        # self.render("templates/index.html", users=Player.objects.all())

        # form = LoginForm()
        # self.render('templates/toro/login.html', form=form, button_name='Login', url='ttt:login')

        # def post(self):
        #     if request.method == 'POST':
        #         form = LoginForm(request.POST)
        #         user = None
        #         if form.is_valid():
        #             user = form.authenticate()
        #
        #         if user is not None:
        #             request.session['user'] = user.name
        #             request.session.set_expiry(0)
        #             return self.redirect('/ttt/menu/')
        #         else:
        #             return HttpResponseRedirect('/ttt/invalid/')
