import { UploadCloud, File, Image as ImageIcon, FileText } from 'lucide-react';

export default function EvidenceStorage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evidence Storage</h1>
        <p className="mt-1 text-sm text-slate-500">
          Securely upload and manage medico-legal documents and digital evidence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Upload New Evidence</h2>
            
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-300 group-hover:text-primary-500 transition-colors" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-slate-500">PNG, JPG, PDF up to 50MB</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-900">Recent Uploads</h3>
            </div>
            <ul role="list" className="divide-y divide-slate-100">
              {[
                { name: 'Crime Scene Photo 1.jpg', size: '2.4 MB', type: 'image' },
                { name: 'MLEF_Case_2026001.pdf', size: '1.2 MB', type: 'document' },
                { name: 'Lab_Results_Toxicology.pdf', size: '840 KB', type: 'document' },
              ].map((file, idx) => (
                <li key={idx} className="flex items-center justify-between gap-x-6 py-4 px-6 hover:bg-slate-50 transition-colors">
                  <div className="flex min-w-0 gap-x-4 items-center">
                    <div className="h-10 w-10 flex-none rounded-lg bg-slate-100 flex items-center justify-center">
                      {file.type === 'image' ? (
                        <ImageIcon className="h-5 w-5 text-primary-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-slate-900">{file.name}</p>
                      <p className="mt-1 truncate text-xs leading-5 text-slate-500">{file.size} • Linked to Case #{202600 + idx}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <button className="text-sm font-medium text-slate-600 hover:text-primary-600">View</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Categories Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Storage Categories</h3>
            <ul className="space-y-3">
              {[
                { name: 'Photographs', count: 124, icon: ImageIcon, color: 'text-sky-500', bg: 'bg-sky-50' },
                { name: 'MLEF Forms', count: 45, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { name: 'PMR Reports', count: 28, icon: File, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { name: 'Court Orders', count: 12, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map((cat) => (
                <li key={cat.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cat.bg}`}>
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {cat.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
