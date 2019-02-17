import json

from flask import request, Response
from flask.views import MethodView
from weathertracker.measurement_store import add_measurement, get_measurement, query_measurements
from weathertracker.utils.conversion import convert_to_datetime, DatetimeConversionException, normalize


class MeasurementsAPI(MethodView):

    # features/01-measurements/01-add-measurement.feature
    def post(self):

        data = request.get_json()

        if "timestamp" in data.keys():
            if data["timestamp"]:
                try:
                    if not convert_to_datetime(data["timestamp"]):
                        return Response(status=400)
                except (ValueError, OverflowError):
                    return Response(status=400)
        else:
            return Response(status=400)

        normalized = normalize(data)

        return add_measurement(normalized)

    # features/01-measurements/02-get-measurement.feature
    def get(self, timestamp=None):

        # /measurement/<timestamp>
        if timestamp is not None:
            try:
                timestamp = convert_to_datetime(timestamp)

            except DatetimeConversionException:
                return Response(status=400)

            return get_measurement(timestamp)

        # /measurement?queries
        elif request.args.get("fromDateTime") and request.args.get("toDateTime"):
            try:
                from_datetime = convert_to_datetime(request.args.get("fromDateTime"))
                to_datetime = convert_to_datetime(request.args.get("toDateTime"))

            except DatetimeConversionException:
                return Response(status=400)

            return query_measurements(from_datetime, to_datetime)


        # nothing
        else:
            return Response(status=400)
