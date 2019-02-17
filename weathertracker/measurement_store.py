import json
import os

import dateutil
from flask import Response, abort, jsonify
from weathertracker.utils.conversion import ensure_float, convert_to_datetime, get_datastore, normalize, parse_time


def add_measurement(data):

    store = get_datastore()
    store.append(data)
    return Response(status=201, headers={"location":"/measurements/{}".format(data["timestamp"])})


def get_measurement(date):

    data = get_datastore()
    for d in data:
        time = parse_time(d["timestamp"])

        if time == str(date.isoformat()):
            return Response(json.dumps(d), status=200)

    abort(404)


def query_measurements(start_date, end_date):

    data = get_datastore()

    start = str(start_date.isoformat())
    end = str(end_date.isoformat())

    response = []

    for d in data:
        time = parse_time(d["timestamp"])
        if start <= time < end:
            response.append(d)

    if len(response) == 0:
        return Response({}, 200)

    return Response(json.dumps(response), status=200)


