# features/03-interview/02-health-check.feature
FROM ubuntu:16.04

RUN apt-get update -y && \
	apt-get install -y python-pip python-dev

COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt

COPY . /app

EXPOSE 8000

#
HEALTHCHECK CMD curl --fail http://localhost:8000/healthz || exit 1

ENTRYPOINT ["python"]

CMD ["run.py"]



