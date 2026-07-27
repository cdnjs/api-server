import { css, cx } from '@emotion/css';

import theme from '../theme.ts';

import IconCross from './icons/cross.tsx';
import IconLoading from './icons/loading.tsx';
import IconSearch from './icons/search.tsx';

const styles = {
    form: css`
        position: relative;
    `,
    input: css`
        background: ${theme.background.footer};
        border: none;
        border-radius: ${theme.radius};
        color: ${theme.text.primary};
        font-size: ${theme.font.body.size};
        font-weight: ${theme.font.body.weight};
        width: 100%;
        padding: ${theme.spacing(2, 6, 2, 2)};
    `,
    icon: css`
        color: ${theme.text.primary};
        position: absolute;
        right: ${theme.spacing(2)};
        top: 50%;
        transform: translateY(-50%);
        width: ${theme.spacing(3)};
        height: ${theme.spacing(3)};
        pointer-events: none;
    `,
};

const Search = ({
    value,
    onChange,
    state,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    state?: 'idle' | 'loading' | 'failed';
    className?: string;
}) => {
    return (
        <form
            className={cx(styles.form, className)}
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <input
                type="text"
                name="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search libraries on cdnjs..."
                className={styles.input}
            />
            {
                {
                    idle: <IconSearch className={styles.icon} />,
                    loading: <IconLoading className={styles.icon} />,
                    failed: <IconCross className={styles.icon} />,
                }[state ?? 'idle']
            }
        </form>
    );
};

export default Search;
