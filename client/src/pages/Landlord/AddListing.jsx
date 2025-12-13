import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const AddListing = () => {
  const { register, handleSubmit, reset } = useForm();
  const [imageUrls, setImageUrls] = useState([]);

  const onSubmit = async (data) => {
    try {
      // Add uploaded image URLs
      data.images = imageUrls;

      // Send data to your backend
      await axios.post("/api/listings", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Listing submitted for approval!");
      reset();
      setImageUrls([]);
    } catch (err) {
      console.error(err);
      alert("Error submitting listing");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    const uploads = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "your_preset");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
        formData
      );

      return res.data.secure_url;
    });

    const urls = await Promise.all(uploads);
    setImageUrls((prev) => [...prev, ...urls]);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Property Listing</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title")} placeholder="Title" className="input" />
        <textarea {...register("description")} placeholder="Description" className="input" />
        <input type="number" {...register("price")} placeholder="Price" className="input" />
        <input {...register("location")} placeholder="Location" className="input" />
        <input type="number" {...register("numberOfBedrooms")} placeholder="Bedrooms" className="input" />
        <input type="number" {...register("numberOfBathrooms")} placeholder="Bathrooms" className="input" />

        <input type="file" multiple onChange={handleImageUpload} className="input" />

        <button type="submit" className="btn bg-blue-600 text-white px-4 py-2 rounded">
          Submit Listing
        </button>
      </form>
    </div>
  );
};

export default AddListing;
