-- Useful queries to generate metrics

-- MySchedule per session
select session, count(*) from attendance
group by session
order by count desc;

-- Page views
select data->>'routeName' as page, count(*) from logs
where event = 'general/pageView'
group by data->>'routeName'
order by count desc;


-- Session views
select data->'params'->>'sessionId' as session, count(*) from logs
where event = 'general/pageView'
	and data->>'routeName' = 'Session'
group by data->'params'->>'sessionId'
order by count desc;

-- Share uses
select data->>'sessionId' as session, count(*) from logs
where event = 'session/shareVisit'
group by data->>'sessionId'
order by count desc;

-- Registrations
select verified, count(*) from attendees
group by verified
order by count desc;

-- Sessions per user
select attendees.id, attendees.name, attendees.email, string_agg(attendance.session, ',') as sessions
from attendees
inner join attendance on attendance.attendee = attendees.id
group by attendees.id
order by length(string_agg(attendance.session, ',')) desc;

-- Visitors over time
select created, data->>'visitors' as visitors from logs
where event = 'internal/siteVisitors';
