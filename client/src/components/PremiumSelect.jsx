import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'

const PremiumSelect = ({ label, value, onChange, options, placeholder = 'Sélectionner...', icon, required, disabled }) => {
  const selected = options.find(o => o.value === value) || null

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        {label && <Listbox.Label className="form-label">{label}</Listbox.Label>}
        <Listbox.Button className="ps-field">
          <span className="ps-field-content">
            {icon && <span className="ps-field-icon">{icon}</span>}
            {selected ? (
              <span className="ps-field-text">
                {selected.icon && <span className="ps-option-icon">{selected.icon}</span>}
                {selected.label}
              </span>
            ) : (
              <span className="ps-field-placeholder">{placeholder}</span>
            )}
          </span>
          <span className="ps-field-chevron">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="ps-options">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active, selected }) => `ps-option ${active ? 'ps-option-active' : ''} ${selected ? 'ps-option-selected' : ''}`}
              >
                {({ selected }) => (
                  <span className="ps-option-content">
                    {option.icon && <span className="ps-option-icon">{option.icon}</span>}
                    <span className="ps-option-label">{option.label}</span>
                    {selected && (
                      <span className="ps-option-check">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
        {required && !value && <input tabIndex={-1} required aria-hidden="true" className="absolute opacity-0 w-0 h-0" />}
      </div>
    </Listbox>
  )
}

export default PremiumSelect
