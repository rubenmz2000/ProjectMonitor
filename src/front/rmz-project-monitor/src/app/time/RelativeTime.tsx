import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(relativeTime);

/** A UTC timestamp from the API shown as relative time, with the exact local time on hover. */
function RelativeTime({ value }: { value: string }) {
    const local = dayjs.utc(value).local();
    return (
        <time dateTime={local.toISOString()} title={local.format('DD/MM/YYYY HH:mm')}>
            {local.fromNow()}
        </time>
    );
}

export default RelativeTime;
