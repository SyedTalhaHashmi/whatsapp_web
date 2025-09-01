import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
import { CustomButton } from "@/components/pages/CustomButton"

export default function LeaveReply() {
  return (
    <div className="max-w-4xl mx-auto mt-12 mb-16">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Leave a Reply</h2>
      <p className="text-slate-500 mb-4 text-sm">
        Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>
      </p>
      
      <form>
        <div className="mb-6">
          <label htmlFor="comment" className="block mb-2 text-sm font-medium text-medium text-slate-700">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={6}
            required
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:none"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:none"
            />
        </div>
        
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 font-medium text-sm text-slate-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:none"
            />
        </div>
        
        <div className="mb-6">
          <label htmlFor="website" className="block mb-2 font-medium text-sm text-slate-700">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            className="w-full px-3 py-2 border border-black rounded-md focus:outline-none focus:none"
            />
        </div>
        
        {/* <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <Checkbox id="save-info" />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="save-info" className="font-medium text-slate-600">
              Save my name, email, and website in this browser for the next time I comment.
            </label>
          </div>
        </div> */}
        
        <CustomButton>
            <p className="text-sm text-semibold">Send Message</p>
        </CustomButton>
      </form>
    </div>
  )
}
