import Link from "next/link";

export type DropdownItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type NavDropdownColumnProps = {
  header: string;
  items: DropdownItem[];
};

export function NavDropdownColumn({ header, items }: NavDropdownColumnProps) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
        {header}
      </div>
      <div className='flex flex-col gap-1'>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-900 hover:bg-slate-50 transition-colors'
          >
            {item.icon && (
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100'>
                {item.icon}
              </div>
            )}
            <span className='font-medium'>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

