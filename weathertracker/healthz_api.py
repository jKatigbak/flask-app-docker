from flask import Response
from flask.views import MethodView
class HealthzAPI(MethodView):
    def get(self):
        return Response("PONG", 200)

