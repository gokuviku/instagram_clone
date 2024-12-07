//for chatting.

import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/messsage.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { messsage } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: { senderId, receiverId } },
    });
    //establish the conversation of not started yet.
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    const newMesage = await Message.create({
      senderId,
      receiverId,
      messsage,
    });
    if (newMesage) conversation.messages.push(newMesage._id);
    await Promise.all([conversation.save(), newMesage.save()]);

    //implement socketio for realtime data transfer.
    return res.status(200).json({ success: true, newMesage });
  } catch (error) {
    console.log(error);
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { messsage } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) return res.status(200).json({ messsages: [] });
    return res
      .status(200)
      .json({ success: true, messsages: conversation?.messages });
  } catch (error) {
    console.log(error);
  }
};
