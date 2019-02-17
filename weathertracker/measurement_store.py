import json
import os
import time

import dateutil
from flask import Response, abort, jsonify
from weathertracker.utils.conversion import ensure_float, convert_to_datetime, get_datastore, normalize


package_dir = os.path.dirname(os.path.abspath(__file__))
data_store = os.path.join(package_dir, 'datastore/testdata.json')

# features/03-interview/03-accurate-reporting.feature


def add_measurement(data):

    store = get_datastore()

    print("appending {} to {}".format(data, store))
    store.append(data)

    print("------ > ", store)

    with open(data_store, 'w') as json_file:
        print("writing to datastore")
        json.dump({"data": store}, json_file)


    return Response(status=201, headers={"location":"/measurements/{}".format(data["timestamp"])})


def get_measurement(date):

    data = get_datastore()

    for d in data:
        time = dateutil.parser.parse(d["timestamp"]).isoformat()

        if time == str(date.isoformat()):
            return Response(json.dumps(d), status=200)

    abort(404)


def query_measurements(start_date, end_date):

    data = get_datastore()

    start = str(start_date.isoformat())
    end = str(end_date.isoformat())

    response = []

    for d in data:
        time = dateutil.parser.parse(d["timestamp"]).isoformat()
        if start <= time < end:
            response.append(d)

    if len(response) == 0:
        return Response({}, 200)

    return Response(json.dumps(response), status=200)


