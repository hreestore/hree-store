import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { toast } from '@/components/snackbar';
import { Form, Field } from '@/components/hook-form';
import { Iconify } from '@/components/iconify';


export default function ContactForm() {
    const ContactSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string().required('Email is required').email('Email must be a valid email address'),
        subject: Yup.string().required('Subject is required'),
        message: Yup.string().required('Message is required'),
    });

    const defaultValues = {
        name: '',
        email: '',
        subject: '',
        message: '',
    };

    const methods = useForm({
        resolver: yupResolver(ContactSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            console.log('contact body :', data);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            reset();
            toast.success('Message sent! We will get back to you shortly.');
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message.');``
        }
    });
    return (
        <div className="bg-gray-50/50 p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#711a20]/5 rounded-bl-full" />
            <h3 className="text-2xl font-bold text-gray-900 mb-8 relative z-10">Send us a Message</h3>

            <Form methods={methods} onSubmit={onSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 gap-6">
                    <Field.Text
                        name="name"
                        label="Full Name"
                        placeholder="John Doe"
                        className="  rounded-xl" style={{ boxShadow: "0 2px 30px #dfdfdf" }}
                    />

                </div>
                <div className="flex flex-col gap-5">
                    <Field.Text
                        name="email"
                        label="Email Address"
                        placeholder="john@example.com"
                        className=" py-2 rounded-xl"
                        style={{ boxShadow: "0 2px 30px #dfdfdf" }}

                    />
                    <Field.Text
                        name="subject"
                        label="Subject"
                        placeholder="How can we help?"
                        className=" py-2 rounded-xl mb-6"
                        style={{ boxShadow: "0 2px 30px #dfdfdf" }}
                    />

                    <Field.Text
                        name="message"
                        label="Message"
                        multiline
                        rows={5}
                        placeholder="Your message here..."
                        className=" py-2 rounded-xl mb-6"
                        style={{ boxShadow: "0 2px 30px #dfdfdf" }}
                    />

                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-[#711a20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Iconify icon="eos-icons:loading" className="animate-spin w-5 h-5" />
                            Sending...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Send Message
                            <Iconify icon="carbon:send-alt" className="w-5 h-5" />
                        </span>
                    )}
                </button>
            </Form>
        </div>

    )
}