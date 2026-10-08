import React from 'react';

import { TOOLKIT } from '../constants';

/**
 * What he works with.
 *
 * This used to be a set of progress bars with a percentage against each
 * skill. The percentages were invented, and a made-up number about yourself
 * is worse than no number, so they are index cards now.
 */
const Skills: React.FC = () => (
  <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 xl:grid-cols-4">
    {TOOLKIT.map((group) => (
      <li key={group.group} className="panel flex flex-col p-6">
        <h3 className="label text-accent">{group.group}</h3>
        <ul className="ruled mt-4 list-none p-0">
          {group.items.map((item) => (
            <li key={item} className="py-2 text-base leading-snug text-ink">
              {item}
            </li>
          ))}
        </ul>
      </li>
    ))}
  </ul>
);

export default Skills;
