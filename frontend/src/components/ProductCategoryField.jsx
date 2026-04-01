import React from 'react'

function ProductCategoryField({
  value,
  categories,
  suggestedCategories,
  customCategory,
  onCategoryChange,
  onCustomCategoryChange,
}) {
  const uniqueCategories = Array.from(new Set([...categories, ...suggestedCategories]))

  return (
    <>
      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
        Categoria del producto *
      </label>
      <select
        className="category-select w-full border-2 border-sky-200 bg-sky-50 rounded-xl p-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm font-semibold text-slate-700"
        value={value}
        onChange={(e) => onCategoryChange(e.target.value)}
        required
      >
        <option value="">Selecciona una categoria</option>
        {uniqueCategories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
        <option value="OTHER">--- Otra (especificar) ---</option>
      </select>
      {value === 'OTHER' && (
        <input
          type="text"
          placeholder="Nombre de la nueva categoria (ej: Electrolitos, Alimentos)"
          className="w-full border-2 border-blue-300 rounded-xl p-3 outline-none focus:border-blue-500 font-bold text-sm bg-blue-50"
          value={customCategory}
          onChange={(e) => onCustomCategoryChange(e.target.value)}
          required
        />
      )}
      <p className="text-[11px] font-bold text-gray-400">
        Sugerencia: escribe o selecciona una categoria existente para mantener consistencia. Si necesitas una nueva, selecciona "Otra" para especificarla.
      </p>
    </>
  )
}

export default ProductCategoryField
