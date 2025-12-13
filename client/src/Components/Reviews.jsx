import { StarIcon } from '@heroicons/react/24/solid';

export default function ReviewItem({ review }) {
  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between">
        <h4 className="font-medium">{review.author}</h4>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIcon 
              key={i}
              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700 mt-2">{review.comment}</p>
      <p className="text-sm text-gray-500 mt-2">{review.date}</p>
    </div>
  );
}