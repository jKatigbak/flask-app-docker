import datetime
import json
import os
import shutil

from weathertracker.measurements_api import MeasurementsAPI
from weathertracker.stats_api import StatsAPI
from weathertracker.healthz_api import HealthzAPI
from flask import Flask
import atexit


package_dir = os.path.dirname(os.path.abspath(__file__))
DATA_STORE = os.path.join(package_dir, 'datastore/testdata.json')


def create_app():
    app = Flask(__name__)

    measurements_api = MeasurementsAPI.as_view("measurements")
    app.add_url_rule("/measurements", view_func=measurements_api, methods=["POST", "GET"])
    app.add_url_rule("/measurements/<timestamp>", view_func=measurements_api, methods=["GET"])

    stats_api = StatsAPI.as_view("stats")
    app.add_url_rule("/stats", view_func=stats_api, methods=["GET"])

    healthz_api = HealthzAPI.as_view("healthz")
    app.add_url_rule("/healthz", view_func=healthz_api, methods=["GET"])

    return app

# features/03-interview/01-server-start.feature
def set_new_data():
    new_path = ""
    if os.path.isfile(DATA_STORE):
        new_path = DATA_STORE + "-" + datetime.datetime.today().strftime('%Y-%m-%d')
        shutil.move(DATA_STORE, os.path.join(new_path))
    with open(DATA_STORE, "w") as json_file:
        json.dump({"data": []}, json_file)

    print("data backed up - {}".format(new_path))
    print("gracefully shut down...")


atexit.register(set_new_data)

app = create_app()



@app.route("/")
def root():
    return "Weather tracker is up and running!"
