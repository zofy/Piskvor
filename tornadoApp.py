import logging
import socket
import os

import signal
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
from tornado import gen
from tornado.httpclient import AsyncHTTPClient

from tornado.options import options


is_closing = False


def signal_handler(signum, frame):
    global is_closing
    logging.info('exiting...')
    is_closing = True


def try_exit():
    global is_closing
    if is_closing:
        tornado.ioloop.IOLoop.instance().stop()
        logging.info('exit success')


class WSHandler(tornado.websocket.WebSocketHandler):
    clients = []

    def open(self):
        print 'new connection'
        WSHandler.clients.append(self)

    def on_message(self, message):
        print 'message received:  %s' % message
        # self.check_message(message)
        # Reverse Message and send it back
        # print 'sending back message: %s' % message[::-1]
        # self.write_message(message[::-1])

    def on_close(self):
        print 'connection closed'
        # self.user_logout()
        WSHandler.clients.remove(self)

    def check_origin(self, origin):
        host = self.request.headers.get('Host')
        print(host)
        print(origin)
        return True


# Define the class that will respond to the URL
class ListMessagesHandler(tornado.web.RequestHandler):
    def get(self):
        users = ['Matt', 'Patt', 'Pupo']
        self.render("templates/index.html",
                    users=users)

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

application = tornado.web.Application([
    (r"/", ListMessagesHandler),
    (r"/login", LoginHandler),
    (r'/ws', WSHandler),
])

if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(application)
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, signal_handler)
    http_server.listen(os.environ.get("PORT", 8000))
    myIP = socket.gethostbyname(socket.gethostname())
    print '*** TornadoApp started at %s***' % myIP
    tornado.ioloop.PeriodicCallback(try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()
