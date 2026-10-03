import { useState } from 'react';
import { Button, Checkbox, ListItemText, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import './MultiSelectFilter.css';

export interface MultiSelectFilterOption {
    value: string;
    label: string;
    /** Optional marker color, any CSS color (typically a token value or CSS variable). */
    color?: string;
    /** Optional number shown next to the option (e.g. how many items it matches). */
    count?: number;
}

export interface MultiSelectFilterProps {
    label: string;
    options: MultiSelectFilterOption[];
    /** Selected option values; empty means "no filter". */
    selected: string[];
    onChange: (selected: string[]) => void;
}

/**
 * Generic dropdown filter with multiple selection. An empty selection means the filter is off.
 * The application supplies the options and keeps the selection.
 */
function MultiSelectFilter({ label, options, selected, onChange }: MultiSelectFilterProps) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    const toggle = (value: string) => {
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    };

    const summary = selected.length === 0
        ? null
        : selected.length === 1
            ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
            : `${selected.length}`;

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                color={selected.length > 0 ? 'primary' : 'inherit'}
                endIcon={<ArrowDropDownIcon />}
                onClick={(e) => setAnchor(e.currentTarget)}
                aria-haspopup="listbox"
                className="rmz-multi-select-filter__button"
            >
                {label}
                {summary && <span className="rmz-multi-select-filter__summary">: {summary}</span>}
            </Button>
            <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)}>
                {options.map((option) => (
                    <MenuItem key={option.value} dense onClick={() => toggle(option.value)}>
                        <Checkbox size="small" checked={selected.includes(option.value)} disableRipple className="rmz-multi-select-filter__check" />
                        {option.color && (
                            <span className="rmz-multi-select-filter__marker" style={{ backgroundColor: option.color }} />
                        )}
                        <ListItemText primary={option.label} />
                        {option.count !== undefined && (
                            <span className="rmz-multi-select-filter__count">{option.count}</span>
                        )}
                    </MenuItem>
                ))}
                {selected.length > 0 && (
                    <MenuItem dense onClick={() => onChange([])} className="rmz-multi-select-filter__clear">
                        Clear selection
                    </MenuItem>
                )}
            </Menu>
        </>
    );
}

export default MultiSelectFilter;
