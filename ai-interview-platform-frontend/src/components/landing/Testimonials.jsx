import React from 'react';
import Sourav from "../../assets/Sourav.png";
import Shubham from "../../assets/Shubham.jpeg";
import Satyendra from "../../assets/Satyendra.jpeg";
import Manish from "../../assets/Manish.png";

const testimonials = [
  {
    name: "Sourav Kumar Dubey",
    role: "Software Engineer at Amadeus",
    image: Sourav,
    content: "The system design interviews are incredibly realistic. Being able to explain my architecture while getting feedback is amazing."
  },
  {
    name: "Shubham Kumar Dubey",
    role: "Software Engineer at BrowserStack",
    image: Shubham,
    content: "The behavioral interview practice is a game-changer. It felt like a real interview, and the detailed analysis helped me improve my storytelling."
  },
  {
    name: "Manish Kumar",
    role: "Software Engineer at NetApp",
    image: Manish,
    content: "I was always nervous about technical interviews. PrepHire's coding challenges and real-time hints gave me the confidence I needed."
  },
  {
    name: "Satyendra mishra",
    role: "Software Engineer at Azentio",
    image: Satyendra,
    content: "PrepHire helped me structure my product thinking. The AI feedback on my case study answers was spot on and very detailed."
  }
];

const Testimonials = () => {
  const row1 = testimonials.slice(0, 5);
  const row2 = testimonials.slice(5, 10);

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Loved by <span className="text-indigo-600">Thousands</span> of Candidates
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join the community of professionals who have accelerated their careers with PrepHire.
          </p>
        </div>

        <div className="relative w-full overflow-hidden space-y-8">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-20" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-20" />

          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[...row1, ...row1].map((testimonial, index) => (
              <div 
                key={`row1-${index}`} 
                className="w-[350px] md:w-[400px] flex-shrink-0 mx-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-900">{testimonial.name}</h3>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>

          <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
            {[...row2, ...row2].map((testimonial, index) => (
              <div 
                key={`row2-${index}`} 
                className="w-[350px] md:w-[400px] flex-shrink-0 mx-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100"
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold text-slate-900">{testimonial.name}</h3>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
