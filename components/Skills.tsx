import React from 'react';

import { TOOLKIT } from '../constants';

/**
 * What he works with.
 *
 * This used to be a set of progress bars with a percentage against each
 * skill. The percentages were invented, and a made-up number about yourself
 * is worse than no number, so it is a list now.
 */
const Skills: React.FC = () => (
  <ul className="grid list-none grid-cols-1 gap-x-10 gap-y-0 border-b border-rule-soft p-0 sm:grid-cols-2">
    {TOOLKIT.map((group) => (
      <li
        key={group.group}
        className="border-t border-rule-soft py-5"
      >
        <h3 className="label text-red">{group.group}</h3>
        <p className="mt-2 text-base leading-relaxed text-ink">
          {group.items.join(' · ')}
        </p>
      </li>
    ))}
  </ul>
);

export default Skills;
