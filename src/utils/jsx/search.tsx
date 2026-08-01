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
        background: ${theme.background.body};
        border: none;
        border-radius: ${theme.radius};
        color: ${theme.text.primary};
        font-size: ${theme.font.body.size};
        font-weight: ${theme.font.body.weight};
        width: 100%;
        padding: ${theme.spacing(2, 6, 2, 2)};
    `,
    elevated: css`
        background: ${theme.background.footer};
        box-shadow: 0 0 ${theme.spacing(2)} ${theme.background.footer};
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
    onFocus,
    onBlur,
    onSubmit,
    state,
    elevated,
}: {
    value: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onSubmit?: () => void;
    state?: 'idle' | 'loading' | 'failed';
    elevated?: boolean;
}) => {
    return (
        <form
            className={styles.form}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.();
            }}
        >
            <input
                type="text"
                name="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="Search libraries on cdnjs..."
                autoComplete="off"
                className={cx(styles.input, elevated && styles.elevated)}
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
