from flask import Response
from weathertracker.utils.conversion import get_datastore
import json
from functools import reduce

data_store = get_datastore()


def get_stats(stats, metrics, from_datetime, to_datetime):
    choices = {u'min',
               u'max',
               u'average'}

    data = get_datastore()

    if len(data) == 0:
        return Response(status=400)

    values = []
    for d in data:
        time = d["timestamp"]
        start = str(from_datetime.isoformat())
        end = str(to_datetime.isoformat())

        # https://fits.gsfc.nasa.gov/iso-time.html
        if start <= time < end:
            values.append(d)

    response_data = []

    get_min = lambda x: min(x)
    get_max = lambda y: max(y)
    get_avg = lambda x, y, z: round(reduce(lambda a, b: a + b, z)/len(z))

    is_min = lambda c: c == u'min'
    is_max = lambda c: c == u'max'
    is_avg = lambda c, l: c == u'average' and len(l) > 1


    for m in metrics:
        vals = [v[m] for v in values if v[m] != '']
        for choice in choices:
            if choice in stats:
                try:
                    action = None
                    if is_avg(choice, vals):
                        action = round(float(get_avg(m, choice, vals)), 1)
                        pass

                    elif is_max(choice):
                        action = get_max(vals)
                        pass

                    elif is_min(choice):
                        action = get_min(vals)
                        pass
                    response_data.append([m, choice, action])

                except(ValueError, TypeError):
                    response_data.append([])

    return Response(json.dumps(response_data), status=200)

