import axios from 'axios'
import { useEffect, useState } from 'react'

import { getLocalTimestamp } from '../../../util/util.js';

import EditPropertyProfileFormUI from './EditPropertyProfileFormUI'

const baseUrl     = 'http://localhost:5000';
const propProfApi = `${baseUrl}/api/properties`;

const EditPropertyProfileForm = ({
  profile,
  onUpdate,
  onClose
}) => {

};

export default EditPropertyProfileForm;